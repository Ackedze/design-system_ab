// Synthetic compile-time evidence only. No React tree, target writer or event.
import type { ButtonGroupProps, ButtonElementProps } from 'arui-private/button-group';
import type { CorporateContentProps } from 'arui-private/corporate-content';
export const candidate = {size:56,primaryFirst:true,maxVisibleButtons:4,showSkeleton:false,elements:[
    {children:'Synthetic Alpha',disabled:false,loading:false,dataTestId:'synthetic-a'},
    {children:'Synthetic Beta',disabled:true,loading:false,dataTestId:'synthetic-b'},
]} satisfies ButtonGroupProps;
const element:ButtonElementProps={children:'Synthetic',disabled:false,loading:false};
const body:CorporateContentProps={children:'Synthetic Body'};
// Optional callback absence is type-checked against real React/Core declarations.
const noCallback:Pick<ButtonElementProps,'onClick'>={};
// @ts-expect-error View is deliberately omitted from the public normal element.
const perElementView:ButtonElementProps={children:'Synthetic',view:'primary'};
// @ts-expect-error Business priority is not a public ButtonGroup prop.
const priorityProp:ButtonGroupProps={elements:[],priorityOrder:['synthetic-a','synthetic-b']};
void [element,body,noCallback,perElementView,priorityProp];
