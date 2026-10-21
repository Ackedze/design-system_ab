import React, { forwardRef } from 'react';
import { createCn } from 'bem-react-classname';

import { useResizeObserver } from '../hooks';

import { formatNumber } from './utils';

import './payment-masked-number.css';

const LAST_SYMBOLS_LENGTH = -4;

export type PaymentMaskedNumberProps = Readonly<
    {
        /**
         * Дополнительный className
         */
        className?: string;

        /**
         * Тип номера
         */
        type: 'card' | 'account';

        /**
         * Скрытие основной части
         */
        hideNumber?: boolean;

        /**
         * Номер для маскирования
         */
        number: string;

        /**
         * Слот справа от номера
         */
        rightAddon?: React.ReactNode;

        /**
         * Дополнительный className для rightAddon
         */
        rightAddonClassName?: string;
    } & React.HTMLAttributes<HTMLDivElement>
>;

const CARD_MASK = 'xxxx xxxx xxxx xxxx';
const ACCOUNT_MASK = 'xxxxx xxx x xxxx xxxxxxx';

export const PaymentMaskedNumber = React.memo(
    forwardRef<HTMLDivElement, PaymentMaskedNumberProps>(
        (
            { className, hideNumber, number, type, rightAddon, rightAddonClassName, ...restProps },
            ref,
        ) => {
            const cn = createCn('payment-masked-number', className);

            const firstCharWithEllipsisRef = React.useRef<HTMLSpanElement>(null);
            const minWidthBlockRef = React.useRef<HTMLSpanElement>(null);

            const maskedNumber = React.useMemo(
                () => formatNumber(number, type === 'account' ? ACCOUNT_MASK : CARD_MASK),
                [type, number],
            );

            const { width, ref: resizeObserverRef } = useResizeObserver();

            const { minWidth, shouldRenderOnlyEllipsis } = React.useMemo(() => {
                if (firstCharWithEllipsisRef.current && minWidthBlockRef.current) {
                    const { width: firstChildWithEllipsisWidth } =
                        firstCharWithEllipsisRef.current.getBoundingClientRect();
                    const { width: minWidth } = minWidthBlockRef.current.getBoundingClientRect();

                    return {
                        shouldRenderOnlyEllipsis: firstChildWithEllipsisWidth > width,
                        minWidth,
                    };
                }

                return { shouldRenderOnlyEllipsis: false, minWidth: undefined };
            }, [width]);

            return (
                <div ref={ref} className={cn()} style={{ minWidth }} {...restProps}>
                    {hideNumber ? (
                        '··\u2009'
                    ) : (
                        <div ref={resizeObserverRef} className={cn('collapsible-part')}>
                            <span
                                ref={firstCharWithEllipsisRef}
                                className={cn('first-char-with-ellipsis')}
                            >
                                {`${number[0]}...`}
                            </span>
                            <span ref={minWidthBlockRef} className={cn('min-width-block')}>
                                {`...${maskedNumber.slice(LAST_SYMBOLS_LENGTH)}`}
                            </span>
                            <div
                                className={cn('visible-part')}
                                data-test-id='payment-masked-number-visible-part'
                            >
                                {shouldRenderOnlyEllipsis
                                    ? '...'
                                    : maskedNumber.slice(0, LAST_SYMBOLS_LENGTH)}
                            </div>
                        </div>
                    )}
                    <span
                        className={cn('last-four-digits')}
                        data-test-id='payment-masked-number-last-four'
                    >
                        {maskedNumber.slice(LAST_SYMBOLS_LENGTH)}
                    </span>
                    {rightAddon && (
                        <div className={`${cn('right-addon')} ${rightAddonClassName}`}>
                            {rightAddon}
                        </div>
                    )}
                </div>
            );
        },
    ),
);
