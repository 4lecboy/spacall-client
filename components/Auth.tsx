import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, Text, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to Login
  async function signInWithEmail() {
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
    <View style={styles.container}>
      <Text style={styles.header}>Spacall</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
  },
  spacer: {
    height: 10,
  },
});