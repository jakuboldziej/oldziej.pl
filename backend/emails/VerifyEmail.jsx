import React from "react";
import { Html, Body, Button, Tailwind, Head, Heading, Text, Font, Section, Link } from "@react-email/components";

require('dotenv').config();

const VerifyEmail = ({ userEmail }) => {
  const environment = process.env.NODE_ENV || "production";
  const domain = environment === "production" ? process.env.BACKEND_DOMAIN : process.env.BACKEND_DOMAIN_LOCAL;

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Poppins-Regular"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Poppins&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Tailwind>
        <Body className="mx-auto">
          <Section className="bg-white text-xl p-12 mx-auto text-center">
            <Heading className="text-sm text-slate-500"><Link href="https://oldziej.pl">oldziej.pl</Link></Heading>
            <Heading className="leading-relaxed font-bold my-6">Verify Your Email</Heading>
            <Text className="text-xl">Please verify your email to get full experience by clicking the link below:</Text>
            <Button
              className="rounded-md text-white p-4 bg-[#00b524] mt-6"
              href={`${domain}/api/emails/verify-email?userEmail=${userEmail}`}
            >
              Confirm my account
            </Button>
            <Section>
              <Text className="text-sm text-slate-400 mb-2">This message was generated automatically.</Text>
              <Text className="text-sm text-slate-400 m-0">Don't reply to this message.</Text>
            </Section>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
export default VerifyEmail;

