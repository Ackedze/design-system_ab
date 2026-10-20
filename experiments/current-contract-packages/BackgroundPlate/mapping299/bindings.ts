import { BackgroundPlateView, type BackgroundPlateProps } from 'arui-private/background-plate';

export type BackgroundPlateFamily = 'legacy' | 'promo' | 'slot';
export type BackgroundPlateSemanticProps = {
    Type?: 'Primary' | 'Secondary' | 'Colored' | 'Border';
    Skeleton?: 'False' | 'True';
    Position?: 'Level 1 (outer)' | 'Level 2 (inner)';
    BackgroundColor?: 'base-bg-alt (gray)' | 'base-bg (white)';
};
const views = { Primary: BackgroundPlateView.Primary, Secondary: BackgroundPlateView.Secondary, Colored: BackgroundPlateView.Colored, Border: BackgroundPlateView.Border };
export function bindBackgroundPlate(input: BackgroundPlateSemanticProps = {}, family: BackgroundPlateFamily = 'slot'): Omit<BackgroundPlateProps, 'children'> {
    if (!['legacy', 'promo', 'slot'].includes(family) || Object.keys(input).some(key => !['Type', 'Skeleton', 'Position', 'BackgroundColor'].includes(key))) throw Error('BACKGROUND_PLATE_PORT_UNSUPPORTED');
    const type = input.Type ?? 'Primary', skeleton = input.Skeleton ?? 'False';
    if (!Object.prototype.hasOwnProperty.call(views, type) || !['False', 'True'].includes(skeleton)) throw Error('BACKGROUND_PLATE_VALUE_UNSUPPORTED');
    if (family === 'slot' && (input.Position !== undefined || input.BackgroundColor !== undefined)) throw Error('BACKGROUND_PLATE_SLOT_CONTEXT_UNBOUND');
    if (input.Position !== undefined && !['Level 1 (outer)', 'Level 2 (inner)'].includes(input.Position)) throw Error('BACKGROUND_PLATE_POSITION_UNSUPPORTED');
    if (input.BackgroundColor !== undefined && !['base-bg-alt (gray)', 'base-bg (white)'].includes(input.BackgroundColor)) throw Error('BACKGROUND_PLATE_BACKGROUND_UNSUPPORTED');
    if (type === 'Secondary' && input.Position === 'Level 2 (inner)') throw Error('BACKGROUND_PLATE_SECONDARY_INNER_UNSUPPORTED');
    const result: Omit<BackgroundPlateProps, 'children'> = { view: views[type], showSkeleton: skeleton === 'True' };
    if (family === 'slot') result.paddings = 24; // Published Slot source default, not a universal padding rule.
    if (family === 'promo') result.promo = true;
    if (input.Position !== undefined) result.level = input.Position === 'Level 1 (outer)' ? 'outer' : 'inner';
    if (input.BackgroundColor !== undefined) result.backgroundColor = input.BackgroundColor === 'base-bg-alt (gray)' ? 'base-bg-alt' : 'base-bg';
    return result;
}
