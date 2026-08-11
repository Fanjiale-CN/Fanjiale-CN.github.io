import React from 'react';
import {Composition} from 'remotion';
import {GalokBrandFilm} from './GalokBrandFilm';

export const GalokVideoRoot: React.FC = () => (
  <Composition
    id="GalokBrandFilm"
    component={GalokBrandFilm}
    durationInFrames={1080}
    fps={30}
    width={1920}
    height={1080}
  />
);
