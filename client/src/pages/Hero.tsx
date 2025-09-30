import ACMCSHero from 'acm-cs-sjsu-hero-component';

import MemberBtn from '../components/molecules/member-btn';
import GetInvolvedBtn from '../components/molecules/get-involved-btn';
import SocialBtn from '../components/molecules/social-btn';
import Page from '../components/templates/Page';
import { useQuery } from '@/hooks/useFetch';
import Faq from '@/components/organisms/faq';
import SponsorList from '@/components/organisms/sponsor-list';
import SpotlightList from '@/components/organisms/spotlight-list';
import OfficerList from '@/components/organisms/officer-list';
import { Separator } from '@/components/ui/separator';
import PaymentLinks from '@/components/molecules/payment-links';

const Hero = () => {
  const { data: links } = useQuery('get', '/v1/club/links');

  return (
    <Page>
      <div className="text-center flex-col items-center justify-between space-y-10">
        <div className="min-h-screen">
          <div className="flex place-content-center md:scale-100">
            <ACMCSHero />
          </div>

          <div className="md:text-lg text-[3vw] text-center transform md:-translate-y-24 pb-3 flex-cols md:flex items-center place-content-center gap-5">
            <SocialBtn className="w-full md:w-auto" href={links?.links.discord || ''}>
              <img
                className="dark:invert pr-[2%] md:pr-[5%] w-[5vw] md:w-[30%] h-auto"
                src="./icons/discord.svg"
                width={0}
                height={0}
                alt={''}
              />
              Discord
            </SocialBtn>

            <SocialBtn className="w-full md:w-auto" href={links?.links.instagram || ''}>
              <img
                className="dark:invert pr-[2%] md:pr-[5%] w-[5vw] md:w-[25%] h-auto"
                src="./icons/Instagram.svg"
                width={0}
                height={0}
                alt={''}
              />
              Instagram
            </SocialBtn>

            <SocialBtn className="w-full md:w-auto" href={links?.links.linkedin || ''}>
              <img
                className="dark:invert pr-[2%] md:pr-[5%] w-[5vw] md:w-[25%] h-auto"
                src="./icons/logo2.svg"
                width={0}
                height={0}
                alt={''}
              />
              Linkedin
            </SocialBtn>

            <MemberBtn
              variant="primary"
              className="shadow-md animate-[fadeIn_2s_ease-in-out] hover:scale-110 duration-300"
            />
          </div>

          <div className="animate-[fadeIn_2s_ease-in-out] text-left inline flex flex-col gap-4">
            <div className="text-5xl font-[600]">
              We are the largest <span className="inline text-yellow-500"> Computer Science</span>{' '}
              organization at{' '}
              <span className="inline text-[#1a6096]">San José State University.</span>
            </div>

            <div className="mt-7 text-xl font-[600]">
              Thinking about getting <span className="inline text-yellow-500"> involved? </span>
            </div>
            <div className="py-4 text-base font-normal">
              {' '}
              Engage with other ACM at SJSU members and elevate your tech journey. Access valuable
              resources like mock interviews for interview prep, thrilling hackathons, and coding
              competitions. Connect with industry leaders like Apple, Tesla, and <b>Google</b> for
              exclusive networking opportunities.
            </div>
          </div>
          <MemberBtn
            variant="tertiary"
            className="animate-[fadeIn_2s_ease-in-out] hover:scale-110 duration-300"
          />
        </div>

        <Separator />

        <div className="space-y-5">
          <h1 className="text-4xl font-bold">Sponsors</h1>
          <SponsorList />
        </div>

        <Separator />

        <div className="space-y-2 place-items-center">
          <h1 className="!mt-10 text-4xl font-bold">Teams</h1>
          <h2 className="text-1xl font-bold mb-2 pt-3 text-gray-400">
            We have a place for everyone.
          </h2>
          <div className="place-items-center grid grid-cols-3 grid-rows-1 py-10 gap-64">
            <div className="text-[#8F69C2] font-semibold stroke-slate-500">
              <img
                className="py-3"
                src="./icons/softwareicon.svg"
                width={105}
                height={105}
                alt={''}
              />
              Software
            </div>

            <div className="text-[#C28F69] font-bold">
              <img
                className="py-3"
                src="./icons/hardwareicon.svg"
                width={105}
                height={105}
                alt={''}
              />
              Hardware
            </div>

            <div className="text-[#69C28F] font-bold">
              <img
                className="py-3"
                src="./icons/designicon.svg"
                width={105}
                height={105}
                alt={''}
              />
              Design
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Spotlights</h1>
          <h2 className="text-1xl font-bold pb-10 pt-3 text-gray-400">Our past events.</h2>
          <SpotlightList />
        </div>

        <Separator />

        <OfficerList />

        <Separator />

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Payment Methods</h1>
          <PaymentLinks />
        </div>

        <div className="flex justify-center items-center">
          <GetInvolvedBtn />
        </div>

        <Separator />

        <Faq />
      </div>
    </Page>
  );
};

export default Hero;
