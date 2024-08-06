import React from "react";
import { Html, Body, Button, Tailwind, Head, Container, Heading, Text, Font } from "@react-email/components";

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
        <Body className="text-black text-center mx-auto">
          <Container className="bg-white text-xl p-12">
            <Heading className="text-sm text-slate-500">oldziej.pl</Heading>
            <Heading className="leading-relaxed">Verify Your Email</Heading>
            <Text className="text-xl">
              Please verify your email to get full experience by clicking the link below:
            </Text>
            <Button
              className="rounded-md text-white p-4 bg-[#00b524] mt-6"
              href={`${domain}/api/emails/verify-email?userEmail=${userEmail}`}
            >
              Confirm my account
            </Button>
            <Text className="text-sm text-slate-400">Don't reply to this mail</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
export default VerifyEmail;

