import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { aboutImageOne, appIcons, ijjiTrackerIcon } from '../../../../assets/images';
import { apps } from '../../../../content';
import { cdnImage } from '../../molecules/ProjectCard/cdnImage.ts';
import { ResponsiveImage } from './ResponsiveImage.tsx';

describe('the photos', () => {
    it('each have AVIF and WebP at four widths, a JPEG fallback and their real size', () => {
        expect(aboutImageOne.avif.split(', ')).toHaveLength(4);
        expect(aboutImageOne.webp.split(', ')).toHaveLength(4);
        expect(aboutImageOne.avif).toMatch(/640w.*960w.*1280w.*1920w/);
        expect(aboutImageOne.fallback).toMatch(/\.jpg$/);
        expect(aboutImageOne).toMatchObject({ width: 1920, height: 1278 });
    });

    it('app icons come at icon sizes, with a PNG fallback, and are square', () => {
        expect(ijjiTrackerIcon.avif).toMatch(/160w.*320w.*480w/);
        expect(ijjiTrackerIcon.webp).toMatch(/160w.*320w.*480w/);
        expect(ijjiTrackerIcon.fallback).toMatch(/.png$/);
        expect(ijjiTrackerIcon.width).toBe(ijjiTrackerIcon.height);
    });

    it('every app has an icon', () => {
        expect(apps.filter((app) => !appIcons[app.slug]?.fallback)).toEqual([]);
    });
});

describe('ResponsiveImage', () => {
    it('offers AVIF then WebP, and reserves its space so the page doesn’t jump', () => {
        const { container } = render(<ResponsiveImage image={aboutImageOne} alt='Office' />);
        const img = screen.getByRole('img', { name: 'Office' });

        expect([...container.querySelectorAll('source')].map((s) => s.type)).toEqual([
            'image/avif',
            'image/webp',
        ]);
        expect(img).toHaveAttribute('width', '1920');
        expect(img).toHaveAttribute('height', '1278');
    });

    it('loads lazily unless it is the page’s main image', () => {
        const { rerender } = render(<ResponsiveImage image={aboutImageOne} alt='Office' />);
        expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');

        rerender(<ResponsiveImage image={aboutImageOne} alt='Office' priority />);
        expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
        expect(screen.getByRole('img')).toHaveAttribute('fetchpriority', 'high');
    });
});

describe('cdnImage', () => {
    it('asks Unsplash for the width needed, in the best format', () => {
        const url = new URL(
            cdnImage('https://images.unsplash.com/photo-1?q=80&w=1170&fit=crop', 480),
        );

        expect(url.searchParams.get('w')).toBe('480');
        expect(url.searchParams.get('auto')).toBe('format');
        expect(url.searchParams.get('fit')).toBe('crop');
    });

    it('leaves other hosts alone, including look-alikes', () => {
        for (const url of [
            'https://example.com/a.jpg',
            'https://images.unsplash.com.evil.example/a.jpg',
        ]) {
            expect(cdnImage(url, 480)).toBe(url);
        }
    });
});
