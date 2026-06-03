import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'onChangeText' | 'onBlur' | 'value'> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    error?: string;
    hasError?: boolean;
}

export function FormInput<T extends FieldValues>({
    control,
    name,
    label,
    error,
    hasError,
    className,
    ...textInputProps
}: FormInputProps<T>) {
    return (
        <View className={className}>
            <Text className="text-sm font-semibold text-gray-700 mb-1">{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        className={`w-full bg-white border ${hasError || error ? 'border-red-400' : 'border-gray-200'} rounded-xl p-4 text-gray-900 font-medium text-base`}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value !== undefined ? value.toString() : ''}
                        {...textInputProps}
                    />
                )}
            />
            {error && <Text className="text-red-500 text-xs font-bold mt-1 truncate">{error}</Text>}
        </View>
    );
}
