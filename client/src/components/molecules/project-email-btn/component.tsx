import Btn from '@/components/atoms/btn';
import { useQuery } from '@/hooks/useFetch';
import { Mail } from 'lucide-react';

export interface IProjectEmailBtnProps {
  projectId: string;
}

const ProjectEmailBtn: React.FC<IProjectEmailBtnProps> = ({ projectId }) => {
  const { data: interestedUsers } = useQuery('get', '/v1/projects/{projectID}/interested', {
    params: {
      path: {
        projectID: projectId
      }
    }
  });

  const handleEmailClick = () => {
    const recipients = interestedUsers?.interestedUsers.map((user) => user.email).join(',');
    window.open(`https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${recipients || ''}`, '_blank');
  };

  return (
    <Btn variant="outline" onClick={handleEmailClick}>
      <Mail className="h-5 w-5" />
      <span>Email Interested Users</span>
    </Btn>
  );
};

export { ProjectEmailBtn };
