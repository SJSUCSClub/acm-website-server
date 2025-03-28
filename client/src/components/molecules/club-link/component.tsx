import Btn from '@/components/atoms/btn';
import { Check, ExternalLink, Pencil, X } from 'lucide-react';
import React, { useState } from 'react';
import { RxDiscordLogo, RxFile, RxInstagramLogo, RxLinkedinLogo } from 'react-icons/rx';
import {  useForm } from '@tanstack/react-form';
import { Input } from '@/components/ui/input';
import { useMutation } from '@/hooks/useFetch';
import { toast } from 'sonner';

type LinkType = 'discord' | 'instagram' | 'linkedin' | 'memberApplication';

export interface IClubLinkProps {
  link: string;
  type: LinkType;
}

interface IReadLinkProps extends IClubLinkProps {
  setEdit: (edit: boolean) => void;
}

interface IEditLinkProps extends IClubLinkProps {
  setEdit: (edit: boolean) => void;
  setLink: (link: string) => void;
}

const icons: Record<LinkType, React.ReactNode> = {
  discord: <RxDiscordLogo className="mr-2 h-4 w-4" />,
  instagram: <RxInstagramLogo className="mr-2 h-4 w-4" />,
  linkedin: <RxLinkedinLogo className="mr-2 h-4 w-4" />,
  memberApplication: <RxFile className="mr-2 h-4 w-4" />
};

const ClubLink: React.FC<IClubLinkProps> = ({ link: linkProp, type }) => {
  const [edit, setEdit] = useState(false);
  const [link, setLink] = useState(linkProp);

  return (
    <div>
      {edit ? (
        <EditLink link={link} type={type} setEdit={setEdit} setLink={setLink} />
      ) : (
        <ReadLink link={link} type={type} setEdit={setEdit} />
      )}
    </div>
  );
};

const ReadLink: React.FC<IReadLinkProps> = ({ link, type, setEdit }) => {
  return (
    <div className="w-full flex items-center justify-between border rounded-lg border-gray-200 py-2 px-4">
      <div className="flex items-center w-3/4">
        {icons[type]}
        <p className="line-clamp-1">{link}</p>
      </div>
      <div className="flex items-center justify-end">
        <Btn variant="ghost">
          <a href={link} target="_blank">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Btn>
        <Btn variant="ghost" onClick={() => setEdit(true)}>
          <Pencil className="h-4 w-4" />
        </Btn>
      </div>
    </div>
  );
};

const EditLink: React.FC<IEditLinkProps> = ({ link, type, setEdit, setLink }) => {
  const { mutate } = useMutation('put', '/v1/club/links');
  const form = useForm({
    defaultValues: {
      link
    },
    onSubmit: ({ value }) => {
      console.log(value);
      mutate(
        {
          body: {
            [type]: value.link
          }
        },
        {
          onSuccess: () => {
            console.log('success');
            setLink(value.link);
            setEdit(false);
          },
          onError: () => {
            toast.error('Failed to update club link');
          }
        }
      );
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="w-full flex items-center justify-between border rounded-lg border-gray-200 py-2 px-4"
    >
      <div className="flex items-center w-3/4">
        {icons[type]}
        <form.Field
          name="link"
          children={(field) => (
            <Input
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              type="text"
              className="w-full"
            />
          )}
        />
      </div>
      <div className="flex items-center justify-end">
        <Btn variant="ghost" type="submit">
          <Check className="h-4 w-4" />
        </Btn>
        <Btn variant="ghost" onClick={() => setEdit(false)}>
          <X className="h-4 w-4" />
        </Btn>
      </div>
    </form>
  );
};

export { ClubLink };
