import React from "react";

const CalendarEmbed = () => {
  return (
    <>
      <iframe
        className="top-8"
        src="https://calendar.google.com/calendar/embed?src=c_f6ffdf34c1ec68eef08ebb7071896355e1323cf5a710228e65bc67738cb6e477%40group.calendar.google.com&ctz=America%2FLos_Angeles&bgcolor=%23ffffff"
        style={{ border: "solid 1px #777" }}
        width="700"
        height="500"
      ></iframe>
    </>
  );
};

export default CalendarEmbed;
