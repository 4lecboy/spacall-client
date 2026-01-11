import React, { useMemo } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import ServiceCard from './ServiceCard';
import { COLORS } from '../constants/theme';
import { Service } from '../types';

interface ServicesGridProps {
    services: Service[];
    loading?: boolean;
    error?: Error | null;
    onServicePress: (service: Service) => void;
    onRefresh?: () => void;
}

/**
 * ServicesGrid Component
 * Renders services in a 2-column grid layout with loading and error states
 */
const ServicesGrid: React.FC<ServicesGridProps> = ({
    services,
    loading = false,
    error = null,
    onServicePress,
    onRefresh,
}) => {
    const renderItem = ({ item }: { item: Service }) => (
        <ServiceCard service={item} onPress={onServicePress} />
    );

    const keyExtractor = (item: Service) => item.id;

    if (loading && services.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <CustomText variant="body" style={{ marginTop: 12 }}>
                    Loading services...
                </CustomText>
            </View>
        );
    }

    if (error && services.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <CustomText variant="body" color={COLORS.danger}>
                    Error loading services
                </CustomText>
                {onRefresh && (
                    <TouchableOpacity
                        onPress={onRefresh}
                        style={{ marginTop: 12, padding: 8 }}
                    >
                        <CustomText variant="h3" color={COLORS.primary}>
                            Retry
                        </CustomText>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    if (services.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <CustomText variant="body">No services available</CustomText>
            </View>
        );
    }

    return (
        <FlatList
            data={services}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            refreshing={loading && services.length > 0}
            onRefresh={onRefresh}
        />
    );
};

export default ServicesGrid;
