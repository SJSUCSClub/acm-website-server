import moment from 'moment';

export const formatDate = (date: string) => new Date(date).toLocaleString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export const formatTime = (time: string) => moment(time, 'HH:mm:ss').format('h:mm A');
