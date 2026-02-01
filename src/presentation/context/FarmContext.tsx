import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { GetFarmByIdUseCase, GetFarmsForUserUseCase } from '../../application/usecases/farms';
import { Farm } from '../../domain/entities/Farm';
import { useAuth } from './AuthContext'; // Assuming AuthContext exists based on user prompt

interface FarmContextData {
    currentFarm: Farm | null;
    availableFarms: Farm[];
    isLoading: boolean;
    error: string | null;
    selectFarm: (farmId: string) => Promise<void>;
    refreshFarms: () => Promise<void>;
}

const FarmContext = createContext<FarmContextData>({} as FarmContextData);

export const FarmProvider: React.FC<{
    children: React.ReactNode;
    getFarmsForUserUseCase: GetFarmsForUserUseCase;
    getFarmByIdUseCase: GetFarmByIdUseCase;
}> = ({ children, getFarmsForUserUseCase, getFarmByIdUseCase }) => {
    const { user } = useAuth();
    const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
    const [availableFarms, setAvailableFarms] = useState<Farm[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshFarms = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);
        try {
            const farms = await getFarmsForUserUseCase.execute(user.uid);
            setAvailableFarms(farms);

            // If no farm selected but we have farms, select the first one by default
            if (!currentFarm && farms.length > 0) {
                setCurrentFarm(farms[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch farms');
        } finally {
            setIsLoading(false);
        }
    }, [user, currentFarm, getFarmsForUserUseCase]);

    const selectFarm = async (farmId: string) => {
        setIsLoading(true);
        try {
            const farm = await getFarmByIdUseCase.execute(farmId);
            if (farm) {
                setCurrentFarm(farm);
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

    return (
        <FarmContext.Provider
            value={{
                currentFarm,
                availableFarms,
                isLoading,
                error,
                selectFarm,
                refreshFarms,
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
