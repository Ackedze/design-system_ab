export function mapMaskNumber(value: 'False' | 'True'): boolean {
    if (value !== 'False' && value !== 'True') throw new Error('PMN_MASK_VALUE_UNSUPPORTED');
    return value === 'True';
}
