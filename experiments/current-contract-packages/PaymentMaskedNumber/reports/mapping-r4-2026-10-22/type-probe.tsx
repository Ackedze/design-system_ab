import type { ComponentProps } from 'react';
import { PaymentMaskedNumber } from 'arui-private/payment-masked-number';
import { mapMaskNumber } from './bindings';

type Props = ComponentProps<typeof PaymentMaskedNumber>;
const account: Props = { type: 'account', number: '40802810000000001234', hideNumber: mapMaskNumber('False') };
const card: Props = { type: 'card', number: '5555444433332222', hideNumber: mapMaskNumber('True'), rightAddon: <span>Контекст</span> };
// @ts-expect-error Mask Number is a string enum; React hideNumber is boolean.
const stringMask: Props = { type: 'card', number: '5555444433332222', hideNumber: 'True' };
// @ts-expect-error Full raw number is required; masked Major cannot reconstruct it.
const missingNumber: Props = { type: 'account' };
// @ts-expect-error The library exposes card/account only.
const inventedType: Props = { type: 'phone', number: '1234' };
// @ts-expect-error No Major prop exists in this API.
const inventedMajor: Props = { type: 'card', number: '5555444433332222', major: '5555' };
// @ts-expect-error Addon presets are Figma controls, not React props.
const inventedPreset: Props = { type: 'card', number: '5555444433332222', addonPreset: 'StatusBadge' };
void [account, card, stringMask, missingNumber, inventedType, inventedMajor, inventedPreset];
