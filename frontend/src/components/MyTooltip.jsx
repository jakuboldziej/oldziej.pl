/* eslint-disable react/prop-types */
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

function MyTooltip({ children, title, className }) {
  const renderTooltip = (props) => (
    <Tooltip data-bs-theme="dark" {...props}>
      {title}
    </Tooltip>
  );
  return (
    <OverlayTrigger placement='top' delay={{show: 250, hide: 400}} overlay={renderTooltip}>
      <span className={`tooltip-trigger ${className}`}>{children}</span>
    </OverlayTrigger>
  )
}

export default MyTooltip