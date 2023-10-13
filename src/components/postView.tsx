import { type RouterOutputs } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Image from "next/image";
import React from "react";
import Link from "next/link";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username} prfile picture∏`}
        className="rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="text-slate-300gap-1 flex">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/posts/${post.id}`}>
            <span className="font-thin">{`  - ${dayjs(
              post.createdAt,
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl ">{post.content}</span>
      </div>
    </div>
  );
};

export default PostView;
