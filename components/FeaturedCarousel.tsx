import React, { useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import CustomText from './CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Service } from '../types';
import { getServiceImage } from '../constants/serviceImages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.8);
const CARD_SPACING = Math.round((SCREEN_WIDTH - CARD_WIDTH) / 2);

interface FeaturedCarouselProps {
    services: Service[];
    onPress: (service: Service) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ services, onPress }) => {
    const [errorIds, setErrorIds] = useState<Record<string, boolean>>({});
    // Prefer explicitly featured services; if none are marked on the backend,
    // fall back to the first few services so the carousel is still visible.
    const featured = useMemo(() => {
        const picked = services.filter(s => s.featured);
        if (picked.length > 0) return picked;
        // fallback: take up to 3 services
        return services.slice(0, 3);
    }, [services]);

    if (!featured || featured.length === 0) return null;

    const renderItem = ({ item }: { item: Service }) => {
        const local = getServiceImage(item);
        const shouldUseRemote = !!item.image_url && !errorIds[item.id];
        const source = shouldUseRemote ? { uri: item.image_url as string } : local;

        const handleError = () => {
            if (!errorIds[item.id] && local) {
                setErrorIds(prev => ({ ...prev, [item.id]: true }));
            }
        };

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onPress(item)}
                style={{ width: CARD_WIDTH, paddingHorizontal: 8 }}
            >
                <View
                    style={{
                        backgroundColor: COLORS.white,
                        borderRadius: SIZES.radius,
                        overflow: 'hidden',
                        ...SHADOWS.medium,
                    }}
                >
                    {source ? (
                        <Image
                            source={source}
                            style={{ width: '100%', height: 160 }}
                            resizeMode="cover"
                            onError={handleError}
                        />
                    ) : (
                        <View style={{ width: '100%', height: 160, backgroundColor: COLORS.goldLight }} />
                    )}

                    <View style={{ padding: 12 }}>
                        <CustomText variant="h3">{item.name}</CustomText>
                        <CustomText variant="caption">{item.duration_min} mins • {item.category}</CustomText>
                        <CustomText variant="body" color={COLORS.primary} style={{ marginTop: 8 }}>
                            ₱{item.price}
                        </CustomText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ marginBottom: 16 }}>
            <FlatList
                data={featured}
                renderItem={renderItem}
                keyExtractor={(i) => i.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH}
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: CARD_SPACING }}
            />
        </View>
    );
};

export default FeaturedCarousel;
