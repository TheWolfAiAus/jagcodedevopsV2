import React from 'react';
import { View } from 'react-native';
import { WolfAI } from '../../src/wolf/WolfAI';

export default function WolfTab() {
  return (
    <View style={{ flex: 1 }}>
      <WolfAI />
    </View>
  );
}
