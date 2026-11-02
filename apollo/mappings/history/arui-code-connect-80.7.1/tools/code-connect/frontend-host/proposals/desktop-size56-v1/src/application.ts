import {validateActions, type Invocation, type ProposalMode, type TextAction} from './recipe';

export type ProfileId = 'desktop-size56.baseline-no-overflow.v1' | 'desktop-size56.opt-in-overflow-commands.v1';
export type ActionSpec = Omit<TextAction, 'execute'> & {commandRef: string};
export type ProposalApplication = {profileId: ProfileId; groupId: string; platform: 'desktop'; size: 56;
    mode: ProposalMode; inlineSize: number; actions: readonly ActionSpec[]};
export type CommandBank = Readonly<Record<string, (invocation: Invocation) => void>>;

// Review-only adapter for a serializable caller DTO. It does not alter ScreenSpec or the registry.
export function materializeProposal(input: ProposalApplication, commands: CommandBank) {
    const expectedProfile = input.mode === 'baseline-no-overflow'
        ? 'desktop-size56.baseline-no-overflow.v1' : 'desktop-size56.opt-in-overflow-commands.v1';
    if (input.platform !== 'desktop' || input.size !== 56 || input.profileId !== expectedProfile) throw new Error('PROFILE_MISMATCH');
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(input.groupId)) throw new Error('INVALID_GROUP_ID');
    if (!Number.isFinite(input.inlineSize) || input.inlineSize <= 0) throw new Error('INVALID_CALLER_ALLOCATION');
    const actions: TextAction[] = input.actions.map(({id, label, view, disabled, commandRef}) => {
        if (!commandRef || !Object.prototype.hasOwnProperty.call(commands, commandRef) || typeof commands[commandRef] !== 'function') {
            throw new Error('MISSING_COMMAND_REF');
        }
        return {id, label, view, disabled, execute: commands[commandRef]};
    });
    validateActions(actions, input.mode);
    return {groupId: input.groupId, actions, mode: input.mode, inlineSize: input.inlineSize};
}
