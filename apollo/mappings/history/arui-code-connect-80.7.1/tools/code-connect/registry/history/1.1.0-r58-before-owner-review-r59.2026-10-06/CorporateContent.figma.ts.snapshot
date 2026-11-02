// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=89622-29551
// source=src/corporate-content/corporate-content.tsx
// component=CorporateContent
import figma from 'figma';

const instance = figma.selectedInstance;
const body = instance.getSlot('[D] Body');

// Background modes and responsive geometry are not React component props.
// Keep defaults; never manufacture background, grid, width or platform props.
export default {
    example: figma.code`<CorporateContent>${body}</CorporateContent>`,
    imports: ['import { CorporateContent } from "arui-private/corporate-content";'],
    id: 'web-corp.corporate-content',
    metadata: {
        nestable: true,
        props: {
            componentId: 'web-corp.corporate-content',
            representationId: 'web-corp.corporate-content.figma.desktop',
            mappedCapabilities: ['body-content'],
            contractId: 'corporate-content.desktop',
            codeRepresentationId: 'web-corp.corporate-content.code.arui-private.desktop',
            codeRepresentationStatus: 'draft',
            targetProduct: 'apollo-v4',
            fullContractParity: 'not-confirmed',
        },
    },
};
