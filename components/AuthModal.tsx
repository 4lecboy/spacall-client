import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Image, ScrollView, Linking } from 'react-native';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import CustomText from './CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { supabase } from '../lib/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // What to do after login (e.g., go to checkout)
}

export default function AuthModal({ visible, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login/Signup
  const [showEmailForm, setShowEmailForm] = useState(false);

  async function handleOAuth(provider: 'google' | 'facebook') {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
      // On React Native, supabase returns a url we should open in the browser
      if (data?.url) {
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Continue in browser', 'Please complete authentication in your browser.');
      }
    } catch (err: any) {
      Alert.alert('OAuth Error', err.message || 'Failed to start OAuth flow');
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth() {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);

    try {
      if (isSignUp) {
        // SIGN UP FLOW
        const { data: { session }, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Note: The database trigger we added earlier handles the Profile creation automatically!
        if (session) {
          Alert.alert('Welcome!', 'Account created successfully.');
          onSuccess();
        } else {
          Alert.alert('Check your email', 'Please verify your email to continue.');
        }

      } else {
        // LOGIN FLOW
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      }
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.backdrop}>

        {/* Tap background to close */}
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />

        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
          <View style={styles.sheetWrapper}>
            <View style={styles.hero}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.heroArtWrapper}>
                <Image source={require('../assets/logo.png')} style={styles.heroArt} resizeMode="contain" />
              </View>
            </View>

            <View style={styles.container}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                <CustomText variant="h2" style={{ textAlign: 'center', marginBottom: 6 }}>
                  Sign up or log in
                </CustomText>
                <CustomText variant="body" style={{ textAlign: 'center', marginBottom: 20, color: COLORS.muted }}>
                  Select your preferred method to continue
                </CustomText>

                {/* Social buttons */}
                <TouchableOpacity style={styles.socialBtn} onPress={() => handleOAuth('google')} activeOpacity={0.9} disabled={loading}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <AntDesign name="google" size={20} color="#DB4437" />
                    <CustomText variant="body" color={COLORS.secondary}>Continue with Google</CustomText>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#1877F2', borderColor: '#1877F2' }]} onPress={() => handleOAuth('facebook')} activeOpacity={0.9} disabled={loading}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <FontAwesome name="facebook" size={20} color={COLORS.white} />
                    <CustomText variant="body" color={COLORS.white}>Continue with Facebook</CustomText>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowEmailForm(!showEmailForm)} style={{ alignItems: 'center', marginVertical: 12 }}>
                  <CustomText variant="body" color={COLORS.primary}>
                    {showEmailForm ? 'Hide email login' : 'View more methods'}
                  </CustomText>
                </TouchableOpacity>

                {showEmailForm && (
                  <View>
                    {/* Inputs */}
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      returnKeyType="next"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      placeholderTextColor="#999"
                      returnKeyType="done"
                      onSubmitEditing={handleAuth}
                    />

                    {/* Main Action Button */}
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleAuth} disabled={loading}>
                      {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                      ) : (
                        <CustomText variant="h3" color={COLORS.white}>
                          {isSignUp ? 'Sign Up & Book' : 'Log In & Book'}
                        </CustomText>
                      )}
                    </TouchableOpacity>

                    {/* Toggle Login/Signup */}
                    <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={{ marginTop: 16, alignItems: 'center' }}>
                      <CustomText variant="body" color={COLORS.primary}>
                        {isSignUp ? 'Already have an account? Log In' : 'New here? Create Account'}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ alignItems: 'center', marginTop: 16 }}>
                  <CustomText variant="caption" color={COLORS.muted} style={{ textAlign: 'center' }}>
                    By continuing you agree to our Terms and Privacy Policy.
                  </CustomText>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>

      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetWrapper: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
  },
  hero: {
    backgroundColor: COLORS.primary,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 6,
  },
  heroArtWrapper: {
    width: 150,
    height: 150,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  heroArt: {
    width: 110,
    height: 110,
  },
  container: {
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    paddingBottom: 30,
  },
  input: {
    backgroundColor: COLORS.white,
    height: 55,
    borderRadius: SIZES.radius,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
    fontFamily: 'Lato_400Regular' // If you loaded this font
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...SHADOWS.light,
  },
  socialBtn: {
    height: 54,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  socialBtnDark: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
});