import React, { ComponentType, ReactNode } from "react";

/**
 * AppProviders - Composes multiple context providers into a single component
 * 
 * This utility prevents deeply nested provider hell when you have many contexts.
 * Instead of:
 *   <Provider1><Provider2><Provider3>...</Provider3></Provider2></Provider1>
 * 
 * You can write:
 *   <AppProviders providers={[Provider1, Provider2, Provider3]} />
 * 
 * This is especially important as the app grows with more modules:
 * inventory, gps, finances, workers, livestock, etc.
 */

interface AppProvidersProps {
    providers: ComponentType<{ children: ReactNode }>[];
    children: ReactNode;
}

export function AppProviders({ providers, children }: AppProvidersProps) {
    return providers.reduceRight(
        (acc, Provider) => <Provider>{acc}</Provider>,
        children
    );
}
