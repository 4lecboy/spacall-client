import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
        <TouchableOpacity style={{flex: 1}} onPress={onClose} />

        <View style={styles.container}>
          <CustomText variant="h2" style={{ textAlign: 'center', marginBottom: 5 }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CustomText>
          <CustomText variant="body" style={{ textAlign: 'center', marginBottom: 25, color: COLORS.muted }}>
            {isSignUp ? 'Sign up to book your relaxation.' : 'Log in to continue your booking.'}
          </CustomText>

          {/* Inputs */}
          <TextInput 
            style={styles.input} 
            placeholder="Email Address" 
            autoCapitalize="none" 
            value={email} 
            onChangeText={setEmail} 
            placeholderTextColor="#999"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword}
            placeholderTextColor="#999" 
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
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={{ marginTop: 20, alignItems: 'center' }}>
            <CustomText variant="body" color={COLORS.primary}>
              {isSignUp ? 'Already have an account? Log In' : 'New here? Create Account'}
            </CustomText>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: SIZES.padding,
    paddingBottom: 40,
    ...SHADOWS.medium,
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
});