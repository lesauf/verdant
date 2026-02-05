import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckPermissionUseCase, CreateFarmUseCase, GetFarmByIdUseCase, GetFarmsForUserUseCase } from '../../application/usecases/farms';
import { Farm, FarmMember, FarmRole } from '../../domain/entities/Farm';
import { RoleTemplate } from '../../domain/entities/RoleTemplate';
import { useRoleTemplateMigration } from '../hooks/useRoleTemplateMigration';
import { useAuth } from './AuthContext';

interface FarmContextData {
    currentFarm: Farm | null;
    availableFarms: Farm[];
    members: FarmMember[];
    userRole: FarmRole | null;
    isLoading: boolean;
    isInitialLoad: boolean;
    error: string | null;
    permissions: string[]; // Added permissions list
    selectFarm: (farmId: string) => Promise<void>;
    refreshFarms: () => Promise<void>;
    createFarm: (name: string) => Promise<void>;
    hasPermission: (permission: FarmRole) => boolean; // Keep for backward compatibility
    can: (permission: string) => boolean; // New granular permission helper
}

const FarmContext = createContext<FarmContextData>({} as FarmContextData);

export const FarmProvider: React.FC<{
    children: React.ReactNode;
    getFarmsForUserUseCase: GetFarmsForUserUseCase;
    getFarmByIdUseCase: GetFarmByIdUseCase;
    createFarmUseCase: CreateFarmUseCase;
    checkPermissionUseCase: CheckPermissionUseCase;
}> = ({ children, getFarmsForUserUseCase, getFarmByIdUseCase, createFarmUseCase, checkPermissionUseCase }) => {
    const { user } = useAuth();
    const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
    const [availableFarms, setAvailableFarms] = useState<Farm[]>([]);
    const [members, setMembers] = useState<FarmMember[]>([]);
    const [userRole, setUserRole] = useState<FarmRole | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]); // New permissions state
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auto-migrate farm to role templates when selected
    useRoleTemplateMigration(currentFarm?.id || null);

    const selectFarm = useCallback(async (farmId: string) => {
        if (!user) return;
        setIsLoading(true);
        try {
            const farm = await getFarmByIdUseCase.execute(farmId);
            if (farm) {
                setCurrentFarm(farm);
                const farmMembers = await checkPermissionUseCase.farmRepository.getMembers(farm.id);
                setMembers(farmMembers);

                const member = farmMembers.find(m => m.userId === user.uid);
                if (member) {
                    setUserRole(member.role);

                    // For now, let's fetch all permissions from the role template
                    // This is more efficient for the synchronous 'can' helper
                    const roleTemplates = await checkPermissionUseCase.roleTemplateRepository.findByFarmId(farm.id);
                    const template = roleTemplates.find((t: RoleTemplate) =>
                        t.id === member.role || t.name.toLowerCase() === member.role.toLowerCase()
                    );

                    if (template) {
                        const mergedPermissions = Array.from(new Set([
                            ...template.permissions,
                            ...(member.customPermissions || [])
                        ]));
                        setPermissions(mergedPermissions as string[]);
                    } else if (member.role === 'owner') {
                        setPermissions(['*']); // Wildcard for legacy owner
                    } else {
                        setPermissions([]);
                    }
                }
            } else {
                throw new Error('Farm not found');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to select farm');
        } finally {
            setIsLoading(false);
        }
    }, [user, getFarmByIdUseCase, checkPermissionUseCase]);

    const refreshFarms = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);
        try {
            const farms = await getFarmsForUserUseCase.execute(user.uid);
            setAvailableFarms(farms);

            if (!currentFarm && farms.length > 0) {
                const firstFarm = farms[0];
                await selectFarm(firstFarm.id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch farms');
            setIsLoading(false);
        } finally {
            if (!currentFarm) setIsLoading(false);
            setIsInitialLoad(false);
        }
    }, [user, currentFarm, getFarmsForUserUseCase, selectFarm]);

    const createFarm = async (name: string) => {
        if (!user) {
            console.warn('FarmProvider: Cannot create farm, no user authenticated');
            return;
        }
        setIsLoading(true);
        try {
            await createFarmUseCase.execute({ name, ownerId: user.uid });
            await refreshFarms();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create farm');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshFarms();
    }, [user, refreshFarms]);

    // Legacy role check
    const hasPermission = (requiredRole: FarmRole): boolean => {
        if (!userRole) return false;
        if (userRole === 'owner') return true;
        const roles: FarmRole[] = ['worker', 'manager', 'owner'];
        const userRoleIdx = roles.indexOf(userRole);
        const requiredRoleIdx = roles.indexOf(requiredRole);
        if (userRoleIdx === -1) return false; // Might be a template ID
        return userRoleIdx >= requiredRoleIdx;
    };

    // New granular permission check
    const can = (permission: string): boolean => {
        if (permissions.includes('*')) return true;

        // Simple exact match
        if (permissions.includes(permission)) return true;

        // Wildcard match (e.g., 'tasks:*' matches 'tasks:edit')
        const [resource, action] = permission.split(':');
        if (permissions.includes(`${resource}:*`)) return true;

        return false;
    };

    return (
        <FarmContext.Provider
            value={{
                currentFarm,
                availableFarms,
                members,
                userRole,
                permissions,
                isLoading,
                isInitialLoad,
                error,
                selectFarm,
                refreshFarms,
                createFarm,
                hasPermission,
                can,
            }}
        >
            {children}
        </FarmContext.Provider>
    );
};

export const useFarm = () => {
    const context = useContext(FarmContext);
    if (!context) {
        throw new Error('useFarm must be used within a FarmProvider');
    }
    return context;
};
