import React from "react";
import { Html, Body, Button, Tailwind, Head, Container, Heading, Text, Font, Link } from "@react-email/components";

require('dotenv').config();

const ChangeEmail = ({ userEmail, newUserEmail }) => {
  const environment = process.env.NODE_ENV || "production";
  const domain = environment === "production" ? process.env.BACKEND_DOMAIN : process.env.BACKEND_DOMAIN_LOCAL;

  return (
    <Html className="w-full">
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
        <Body className="text-black text-center mx-auto">
          <Container className="bg-white text-xl p-12">
            <Heading className="text-sm text-slate-500"><Link href="https://oldziej.pl">oldziej.pl</Link></Heading>
            <Heading className="leading-relaxed">Change Your Email</Heading>
            <Text className="text-xl">Your email will be changed to: {newUserEmail}</Text>
            <Text className="text-xl">Change your email by clicking the link below:</Text>
            <Button
              className="rounded-md text-white p-4 bg-[#00b524] mt-6"
              href={`${domain}/api/emails/change-email?userEmail=${userEmail}&newUserEmail=${newUserEmail}`}
            >
              Change email
            </Button>
            <Container>
              <Text className="text-sm text-slate-400 mb-2">This message was generated automatically.</Text>
              <Text className="text-sm text-slate-400 m-0">Don't reply to this message.</Text>
            </Container>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
export default ChangeEmail;

