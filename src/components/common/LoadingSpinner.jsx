import React, { memo } from 'react';

const Spinner = memo(() => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" height="100%" width="100%">
      <radialGradient id="a" cx=".66" fx=".66" cy=".313" fy=".313" gradientTransform="scale(1.5)">
        <stop offset="0" stopColor="currentColor" />
        <stop offset=".3" stopColor="currentColor" stopOpacity=".9" />
        <stop offset=".6" stopColor="currentColor" stopOpacity=".6" />
        <stop offset=".8" stopColor="currentColor" stopOpacity=".3" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0" />
      </radialGradient>
      <circle transform-origin="center" fill="none" stroke="url(#a)" strokeWidth="21" strokeLinecap="round" strokeDasharray="200 1000" cx="100" cy="100" r="70">
        <animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="360;0" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite" />
      </circle>
      <circle transform-origin="center" fill="none" opacity=".2" stroke="currentColor" strokeWidth="21" strokeLinecap="round" cx="100" cy="100" r="70" />
    </svg>
  );
});

const SmallSpinner = memo(({ height, backgroundColor }) => {
  return (
    <span className='w-100 d-flex justify-content-center align-items-center'
      style={{
        height: height ?? 'inherit',
        backgroundColor: '#00000000'
      }}>
      <Spinner />
    </span>
  );
});

const ButtonSpinner = ({ load }) => {
  return (
    <span className={`${load ? 'btn-spinner' : 'd-none'} d-flex justify-content-center align-items-center`}>
      <Spinner />
    </span>
  );
};

const PageLoadingSpinner = ({ load }) => {
  return (
    <div
      className={`page-load-spinner position-absolute d-flex justify-content-center align-items-center ${load ? '' : 'hidden'
        }`}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 9999,
        pointerEvents: load ? 'auto' : 'none',
      }}
    >
      <span
        style={{
          display: 'block',
          height: '50px',
          color: 'black',
        }}
      >
        <Spinner />
      </span>
    </div>
  );
};

export { PageLoadingSpinner, Spinner, ButtonSpinner };
export default SmallSpinner;