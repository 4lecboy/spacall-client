import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomText from '../components/CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { supabase } from '../lib/supabase';

interface Props {
    onSkip: () => void;
    onLoginSuccess: () => void;
}

export default function LoginScreen({ onSkip, onLoginSuccess }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const passwordRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing info', 'Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            onLoginSuccess();
        } catch (error: any) {
            Alert.alert('Login failed', error.message || 'Unable to sign in.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Enter email', 'Please enter your email to receive a reset link.');
            return;
        }

        setResetLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            Alert.alert('Check your inbox', 'We sent a password reset link to your email.');
        } catch (error: any) {
            Alert.alert('Reset failed', error.message || 'Unable to send reset email.');
        } finally {
            setResetLoading(false);
        }
    };

    const handleSocial = (provider: 'facebook' | 'google') => {
        Alert.alert('Coming soon', `Sign in with ${provider === 'facebook' ? 'Facebook' : 'Google'} is coming soon.`);
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
                    <View>
                        <View style={styles.skipRow}>
                            <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
                                <CustomText variant="body" color={COLORS.secondary}>Skip</CustomText>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.hero}>
                            <View style={styles.logoWrapper}>
                                <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                            </View>
                            <CustomText variant="h1" style={styles.title}>Spacall</CustomText>
                            <CustomText variant="body" color={COLORS.muted} style={{ textAlign: 'center' }}>
                                Book luxury massage services from the comfort of your home.
                            </CustomText>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputRow}>
                                <Ionicons name="mail-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputBare}
                                    placeholder="Email"
                                    placeholderTextColor={COLORS.muted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    returnKeyType="next"
                                    blurOnSubmit={false}
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                />
                            </View>

                            <View style={[styles.inputRow, { marginTop: 16 }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputBare}
                                    placeholder="Password"
                                    placeholderTextColor={COLORS.muted}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    value={password}
                                    onChangeText={setPassword}
                                    returnKeyType="done"
                                    ref={passwordRef}
                                    blurOnSubmit={true}
                                    onSubmitEditing={handleLogin}
                                />
                            </View>

                            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotRow} disabled={resetLoading}>
                                {resetLoading ? (
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                    <CustomText variant="caption" color={COLORS.muted}>Forgot Password?</CustomText>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <CustomText variant="h3" color={COLORS.white}>Log In</CustomText>
                                )}
                            </TouchableOpacity>

                            <View style={styles.separator}>
                                <View style={styles.line} />
                                <CustomText variant="caption" color={COLORS.muted}>or continue with</CustomText>
                                <View style={styles.line} />
                            </View>

                            <View style={styles.socialRow}>
                                <TouchableOpacity style={styles.socialIcon} onPress={() => handleSocial('facebook')}>
                                    <FontAwesome name="facebook" size={20} color="#1877F2" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialIcon} onPress={() => handleSocial('google')}>
                                    <AntDesign name="google" size={20} color="#DB4437" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    skipRow: {
        alignItems: 'flex-end',
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    hero: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    logoWrapper: {
        width: 140,
        height: 140,
        borderRadius: 28,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        ...SHADOWS.light,
    },
    logo: {
        width: 110,
        height: 110,
    },
    title: {
        marginBottom: 6,
    },
    form: {
        backgroundColor: 'transparent',
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        height: 48,
    },
    inputIcon: {
        width: 28,
    },
    inputBare: {
        flex: 1,
        fontSize: 16,
        color: COLORS.secondary,
        paddingVertical: 8,
    },
    forgotRow: {
        alignSelf: 'flex-end',
        marginTop: 10,
        marginBottom: 18,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        ...SHADOWS.light,
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        gap: 10,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 18,
    },
    socialIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
});
