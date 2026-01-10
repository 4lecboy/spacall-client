import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Text,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS, SIZES, FONTS, SHADOW } from '../constants/theme';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to Login
  async function signInWithEmail() {
    Keyboard.dismiss();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Login Error', error.message);
    setLoading(false);
  }

  // Function to Sign Up
  async function signUpWithEmail() {
    Keyboard.dismiss();
    setLoading(true);
    // 1. Create User in Auth
    const { data: { session }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Sign Up Error', error.message);
      setLoading(false);
      return;
    }

    // 2. Create Profile in Database (Linking Auth ID to our 'profiles' table)
    // Note: We only do this if a session was created successfully
    if (session) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: session.user.id, 
            email: session.user.email,
            role: 'CLIENT', // Default role for this app
            full_name: 'New User' 
          }
        ]);
        
      if (profileError) {
        console.error('Error creating profile:', profileError);
      } else {
        Alert.alert('Success', 'Account created! You are now logged in.');
      }
    }
    
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <Text style={styles.header}>Spacall</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={signInWithEmail}
            />
          </View>

          <View style={styles.buttonContainer}>
            {loading ? (
              <ActivityIndicator color="#0000ff" />
            ) : (
              <>
                <Button title="Sign In" onPress={signInWithEmail} />
                <View style={styles.spacer} />
                <Button title="Create Account" color="#841584" onPress={signUpWithEmail} />
              </>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// Replace the styles object in Auth.tsx with this:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background, // Warm cream background
  },
  header: {
    ...FONTS.heading, // Applies serif bold font
    fontSize: 36,
    marginBottom: 40,
    textAlign: 'center',
    color: COLORS.primary, // Gold color for the main title
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 55,
    backgroundColor: COLORS.white,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: COLORS.textMain,
  },
  buttonContainer: {
    marginTop: 10,
    gap: 15, // Adds space between buttons
  },
  // REPLACING STANDARD BUTTONS WITH CUSTOM STYLED ONES:
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOW,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  spacer: {
    height: 10,
  },
});

