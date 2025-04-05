import React from 'react';

function Timeline({ timelineData, timelineType }) {
  // timelineType can be "weddingDay" or "aboutUs" to determine the time/year key

  const getTime = (event) => {
    return timelineType === "aboutUs" ? event.year : event.time;
  };

  return (
    <div className="timeline">
      <ul>
        {timelineData.map((event, index) => (
          <li key={index}>
            <div className="content">
              <div className="badge">{getTime(event)}</div>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Timeline;
