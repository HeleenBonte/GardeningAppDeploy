import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { getJwtToken } from '../auth/storage';
import { API_BASE_URL } from '../config/api';

export default function DebugMeButton() {
  async function callMe() {
    try {
      const token = await getJwtToken();
      const res = await fetch(`${API_BASE_URL}/api/debug/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let body;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('json')) body = await res.json();
      else body = await res.text();
      Alert.alert('debug/me', `status ${res.status}\n\n${JSON.stringify(body)}`);
      // also log for debugger console
      // eslint-disable-next-line no-console
      console.log('debug/me', res.status, body);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('debug/me failed', err);
      Alert.alert('debug/me failed', String(err));
    }
  }

  if (!__DEV__) return null;

  return (
    <TouchableOpacity onPress={callMe} style={{ padding: 8, backgroundColor: '#eee', borderRadius: 8, marginTop: 10 }}>
      <Text style={{ color: '#333', fontWeight: '700' }}>Debug: /api/debug/me</Text>
    </TouchableOpacity>
  );
}
