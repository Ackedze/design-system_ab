// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=142493-164121
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/divider/divider.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=Divider
import figma from 'figma';

const instance = figma.selectedInstance;
const preset = instance.getEnum('Presets', { default: 'default', light: 'light' });
if (!preset) throw new Error('Неизвестный Divider Presets');
const light = preset === 'light';

export default {
    id: 'corp-divider-universal',
    imports: ["import { Divider } from 'arui-private/divider';", ...(light ? ["import type { ComponentProps } from 'react';"] : [])],
    example: light ? figma.code`type Props = ComponentProps<typeof Divider>;
// CSS приложения: .dividerLight { --divider-color: var(--color-light-neutral-translucent-200); }
function Example({ lightClassName }: { lightClassName: NonNullable<Props['className']> }) {
    if (!lightClassName.trim()) throw new Error('Нужен реальный CSS-класс для Divider light');
    return <Divider className={lightClassName} />;
}` : figma.code`<Divider />`,
    metadata: { nestable: !light, props: {
        preset, sourceImport: 'arui-private/divider', sourceExport: 'Divider',
        platforms: ['desktop', 'mobile-web'],
        colorToken: light ? '--color-light-neutral-translucent-200' : '--color-light-neutral-translucent-300',
        requiredContext: light ? ['lightClassName устанавливает --divider-color по CSS-рецепту'] : [],
        semanticElement: 'hr', browserVerified: false,
        notes: ['Общий Divider для Desktop и Mobile Web.', 'Проверены цвета текущего light-контекста Figma; другие modes требуют отдельной сверки CSS.', 'Ширину и отступы задаёт композиция приложения.'],
    } },
};
