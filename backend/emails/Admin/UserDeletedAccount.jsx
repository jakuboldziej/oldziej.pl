import React from "react";
import { Html, Body, Button, Tailwind, Head, Heading, Text, Font, Link, Section } from "@react-email/components";

require('dotenv').config();

const UserDeletedAccount = ({ deletedUser }) => {
  const environment = process.env.NODE_ENV || "production";
  const domain = environment === "production" ? process.env.DOMAIN : process.env.DOMAIN_LOCAL;

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
            <Heading className="leading-relaxed font-bold my-6">User Deleted Account</Heading>
            <Text className="text-xl">User deleted his account: {deletedUser?.displayName}</Text>
            <Text className="text-xl">Go to admin:</Text>
            <Button
              className="rounded-md text-white p-4 bg-[#00b524] mt-6"
              href={`${domain}/admin`}
            >
              Admin
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
export default UserDeletedAccount;

