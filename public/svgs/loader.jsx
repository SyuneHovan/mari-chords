const LoaderIcon = ({className}) => {
    return (
        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#FEF1DE" stroke-width="4" stroke-linecap="round">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dasharray"
            values="0 150;110 150;0 150"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    );
  };
  
  export default LoaderIcon;