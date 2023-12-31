import { SignInButton } from "@clerk/nextjs";
import { useUser } from "@clerk/clerk-react";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";

import Image from "next/image";
import { TRPCError } from "@trpc/server";
import React from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import PostView from "~/components/postView";

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = React.useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors?.content;

      if (errorMessage?.[0]) return toast.error(errorMessage[0]);
      else toast.error("Failed to post! Please try again later.");
      setInput("");
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="profile image"
        className="rounded-full "
        width={56}
        height={56}
      />
      <input
        placeholder="Type Emoji's here!"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") mutate({ content: input });
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button
          onClick={() => mutate({ content: input })}
          className="rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          Post
        </button>
      )}

      {isPosting && (
        <div className="flex items-center  justify-center">
          <LoadingSpinner size={25} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();

  if (postLoading) return <LoadingPage />;

  if (!data)
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No data" });

  return (
    <div className="flex flex-col ">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching posts here asap
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="zborder-b flex border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>

      {isSignedIn && <Feed />}
    </PageLayout>
  );
}
