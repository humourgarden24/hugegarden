// Registry. To add a monument: create monuments/<id>.js and add one import + one entry below.
import taj from './monuments/taj';
import qutub from './monuments/qutub';
import fort from './monuments/fort';

export const monumentsData = { taj, qutub, fort };
export const monumentList = Object.values(monumentsData);
export const getMonument = (id) => monumentsData[id] || null;
