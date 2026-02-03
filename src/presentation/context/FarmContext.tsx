import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckPermissionUseCase, CreateFarmUseCase, GetFarmByIdUseCase, GetFarmsForUserUseCase } from '../../application/usecases/farms';
import { Farm, FarmMember, FarmRole } from '../../domain/entities/Farm';
import { useAuth } from './AuthContext';

interface FarmContextData {
    currentFarm: Farm | null;
    availableFarms: Farm[];
    members: FarmMember[]; // Added members list
    userRole: FarmRole | null;
    isLoading: boolean;
    isInitialLoad: boolean;
    error: string | null;
    selectFarm: (farmId: string) => Promise<void>;
    refreshFarms: () => Promise<void>;
    createFarm: (name: string) => Promise<void>;
    hasPermission: (permission: FarmRole) => boolean;
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
    const [members, setMembers] = useState<FarmMember[]>([]); // Added members state
    const [userRole, setUserRole] = useState<FarmRole | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const createFarm = async (name: string) => {
        if (!user) {
            console.warn('FarmProvider: Cannot create farm, no user authenticated');
            return;
        }
        console.log('FarmProvider: Creating farm', name);
        setIsLoading(true);
        try {
            console.log('FarmProvider: Executing createFarmUseCase');
            await createFarmUseCase.execute({ name, ownerId: user.uid });
            console.log('FarmProvider: Farm created, refreshing list');
            await refreshFarms();
            console.log('FarmProvider: List refreshed');
        } catch (err) {
            console.error('FarmProvider: Error creating farm', err);
            setError(err instanceof Error ? err.message : 'Failed to create farm');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const refreshFarms = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);
        try {
            const farms = await getFarmsForUserUseCase.execute(user.uid);
            setAvailableFarms(farms);

            // If no farm selected but we have farms, select the first one by default
            if (!currentFarm && farms.length > 0) {
                const firstFarm = farms[0];
                selectFarm(firstFarm.id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch farms');
            setIsLoading(false); // Ensure loading stops on error
        } finally {
            if (!currentFarm) setIsLoading(false); // Only stop loading if we didn't call selectFarm
            setIsInitialLoad(false);
        }
    }, [user, currentFarm, getFarmsForUserUseCase]);

    const selectFarm = async (farmId: string) => {
        if (!user) return;
        setIsLoading(true);
        try {
            const farm = await getFarmByIdUseCase.execute(farmId);
            if (farm) {
                setCurrentFarm(farm);
                // Fetch members and role for the selected farm
                const farmMembers = await checkPermissionUseCase['farmRepository'].getMembers(farm.id);
                setMembers(farmMembers); // Set members

                const member = farmMembers.find(m => m.userId === user.uid);
                if (member) setUserRole(member.role);
            } else {
                throw new Error('Farm not found');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to select farm');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshFarms();
    }, [user]);

    const hasPermission = (requiredRole: FarmRole): boolean => {
        if (!userRole) return false;
        const roles: FarmRole[] = ['worker', 'manager', 'owner'];
        return roles.indexOf(userRole) >= roles.indexOf(requiredRole);
    };

    return (
        <FarmContext.Provider
            value={{
                currentFarm,
                availableFarms,
                members,
                userRole,
                isLoading,
                isInitialLoad,
                error,
                selectFarm,
                refreshFarms,
                createFarm,
                hasPermission,
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
