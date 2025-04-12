'use client';

import { createChart } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Props {
    data: { time: string; value: number }[];
}

export default function SeedChart({ data }: Props) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: {
                background: {
                    type: 'solid',
                    color: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                },
                textColor: theme === 'dark' ? '#ffffff' : '#333333',
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: false },
            },
            timeScale: {
                borderVisible: false,
                rightOffset: 0.1,
                leftOffset: 0.1
            },
            rightPriceScale: {
                borderVisible: false,
                visible: true, // y축 눈금은 표시
            },
            crosshair: {
                mode: 0,
                vertLine: { visible: true, width: 1, color: '#999', style: 0 },
                horzLine: { visible: true, width: 1, color: '#999', style: 0 },
                drawTimeAxisLabel: false, // ⛔ 호버 시 하단 시간 표시 제거
            },
        });

        // ✅ Y축 하단 잘림 방지
        chart.priceScale('right').applyOptions({
            scaleMargins: {
                top: 0.25,
                bottom: 0.25, // 아래 여백 확보
            },
        });

        const lineSeries = chart.addAreaSeries({
            lineColor: '#3b82f6',
            topColor: 'rgba(59, 130, 246, 0.4)',
            bottomColor: 'rgba(59, 130, 246, 0.05)',
            lineWidth: 2,
            priceFormat: {
                type: 'custom',
                minMove: 1,
                formatter: (price) => `${Math.round(price).toLocaleString()} 원`,
            },
            priceLineVisible: true,
            lastValueVisible: true,
            crosshairMarkerVisible: false,
        });

        lineSeries.setData(data);
        chart.timeScale().fitContent();

        // ✅ 툴팁
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        Object.assign(tooltip.style, {
            position: 'absolute',
            display: 'none',
            padding: '6px 10px',
            borderRadius: '6px',
            background: theme === 'dark' ? '#111' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            pointerEvents: 'none',
            fontSize: '12px',
            zIndex: 10,
            whiteSpace: 'nowrap',
        });
        chartContainerRef.current.appendChild(tooltip);

        /*chart.subscribeCrosshairMove((param) => {
            if (
                param.point === undefined ||
                !param.time ||
                !param.seriesPrices.get(lineSeries)
            ) {
                tooltip.style.display = 'none';
                return;
            }

            const price = param.seriesPrices.get(lineSeries);
            const date = new Date(param.time as string);
            const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

            tooltip.innerHTML = `<strong>${dateStr}</strong><br>${Math.round(price).toLocaleString()} 원`;
            tooltip.style.left = `${param.point.x + 10}px`;
            tooltip.style.top = `${param.point.y - 30}px`;
            tooltip.style.display = 'block';
        });*/

        const resize = () => {
            chart.applyOptions({
                width: chartContainerRef.current?.clientWidth || 300,
            });
        };

        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
            chart.remove();
            tooltip.remove();
        };
    }, [data, theme]);

    return <div ref={chartContainerRef} className="w-full relative" />;
}