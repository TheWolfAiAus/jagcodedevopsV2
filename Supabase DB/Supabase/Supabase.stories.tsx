import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';

import {Supabase} from './Supabase';

const meta: Meta<typeof Supabase> = {
  component: Supabase,
};

export default meta;

type Story = StoryObj<typeof Supabase>;

export const Basic: Story = {args: {}};
