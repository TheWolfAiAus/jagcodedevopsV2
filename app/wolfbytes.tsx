import React from 'react';
import { View } from 'react-native';
import { WolfbyteToken } from '../src/tokens/WolfbyteToken';

export default function WolfbytesScreen() {
  return (
    <View style={{ flex: 1 }}>
      <WolfbyteToken />
    </View>
  );
}
