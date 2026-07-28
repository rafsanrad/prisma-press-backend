import { title } from "node:process";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  ICreatePostPayload,
  IPostQuery,
  IUpdatePostPayload,
} from "./post.interface";
import { PostWhereInput } from "../../../generated/prisma/models";

const createPost = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

const getAllPosts = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const tags=query.tags?JSON.parse(query.tags as string):null
  const tagsArray=Array.isArray(tags)?tags:[]
//   console.log(tagsArray,"tags Array")

  const andCondition: PostWhereInput[] = [];
  if (query.searchTerm) {
    andCondition.push({
      OR: [
        {
          title: {
            contains: "Ron",
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: "Ron",
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if(query.title){
    andCondition.push({
        title:query.title
    })
  }

  if(query.content){
    andCondition.push({
        content:query.content
    })
  }

  if(query.authorId){
    andCondition.push({
        authorId:query.authorId
    })
  }

  if(query.isFeatured){
    andCondition.push({
        isFeatured:Boolean(query.isFeatured)
    })
  }

  if(query.tags){
    andCondition.push({
        tags:{
            hasSome:tagsArray
        }
    })
  }

  if(query.status){
    andCondition.push({
        status:query.status
    })
  }

  const posts = await prisma.post.findMany({
    //Filtering/Exact match without AND operator

    // where:{
    //     title:"My second post",
    //     content:"Ronaldo"
    // },

    //Filtering/Exact match with AND operator
    // where: {
    //   AND: [
    //     {
    //       title: "My second post",
    //     },
    //     {
    //       content: "Ronaldo",
    //     },
    //   ],
    // },

    //searching / partial match
    // where:{
    //     title:{
    //         contains:"ronaldo",
    //         mode:"insensitive"
    //     },
    //     //Not ideal for partial match
    //     // content:{
    //     //     contains:"Ronaldo"
    //     // }
    // }

    //searching/partial search with or operator
    // where:{
    //     OR:[
    //         {
    //             title:{
    //                 contains:"Ronaldo",
    //                 mode:"insensitive"
    //             }
    //         },
    //         {
    //             content:{
    //                 contains:"Ronaldo",
    //                 mode:"insensitive"
    //             }
    //         }
    //     ]
    // },

    //combining search(OR) and filtering(AND)

    // where: {
    //   //filtering and searching combined
    //   AND: [
    //     {
    //       //searching
    //       OR: [
    //         {
    //           title: {
    //             contains: "Ron",
    //             mode: "insensitive",
    //           },
    //         },
    //         {
    //           content: {
    //             contains: "Ron",
    //             mode: "insensitive",
    //           },
    //         },
    //       ],
    //     },
    //     //filtering
    //     {
    //       title: "Ronaldo Nazario",
    //     },
    //     {
    //       content: "Ronaldo",
    //     },
    //   ],
    // },

    //pagination with (limit or take) and (skip or page)

    // take:1,
    // skip:1,

    //Formula for skip
    // page=4,limit/take=1,skip=(page-1)*limit

    //sorting in ascending or descending order on specifiq field

    // orderBy:{
    //     createdAt:"desc",
    //     title:"asc",
    //     content:"desc"
    // },

    //dynamic searching,filtering
    // where: {
    //   AND: [
    //     query.searchTerm
    //       ? {
    //           OR: [
    //             {
    //               title: {
    //                 contains: query.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //             {
    //               content: {
    //                 contains: query.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //           ],
    //         }
    //       : {},
    //     //Title filtering
    //     //     {
    //     //         title:query.title
    //     //     }
    //     query.title ? { title: query.title } : {},

    //     //content filtering
    //     query.content ? { content: query.content } : {},
    //   ],
    // },

    where: {
      AND: andCondition,
    },

    //dynamic pagination and sorting
    take: limit,
    skip: skip,

    orderBy: {
      //sortby:sortOrder
      [sortBy]: sortOrder,
    },

    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return posts;
};

const getMyPosts = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    //sorting system in prisma
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};

const getPostById = async (postId: string) => {
  // await prisma.post.update({
  //     where:{
  //         id:postId
  //     },
  //     data:{
  //         views:{
  //             increment:1
  //         }
  //     },
  // })
  // // throw new Error("fakr error")
  // const post=await prisma.post.findUniqueOrThrow({
  //     where:{
  //         id:postId
  //     },
  //     include:{
  //         author:{
  //             omit:{
  //                 password:true
  //             }
  //         },
  //         comments:{
  //             where:{
  //                 status: CommentStatus.APPROVED
  //             },
  //             orderBy:{
  //                 createdAt:"desc"
  //             }
  //         },
  //         _count:{
  //             select:{
  //                 comments:true
  //             }
  //         }
  //     }
  // })

  // return post

  //

  //

  const transactionResult = await prisma.$transaction(async (tx) => {
    //work on post update
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    // throw new Error("Fake error")
    //work on post get
    const post = await tx.post.findUniqueOrThrow({
      where: {
        id: postId,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return post;
  });

  return transactionResult;
};

const getPostsStats = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    // const totalPosts = await tx.post.count();

    // const totalPublishedPosts = await tx.post.count({
    //   where: {
    //     status: PostStatus.PUBLISHED,
    //   },
    // });

    // const totalDraftPosts = await tx.post.count({
    //   where: {
    //     status: PostStatus.DRAFT,
    //   },
    // });

    // const totalArchivedPosts = await tx.post.count({
    //   where: {
    //     status: PostStatus.ARCHIVED,
    //   },
    // });

    // const totalComments = await tx.comment.count();

    // const totalApprovedComments = await tx.comment.count({
    //   where: {
    //     status: CommentStatus.APPROVED,
    //   },
    // });

    // const totalRejectedComments = await tx.comment.count({
    //   where: {
    //     status: CommentStatus.REJECTED,
    //   },
    // });

    //     /**
    //      * Not a good approach to counting.
    //      * const allPosts=await tx.post.findMany()
    //      * let totalPostViews=0
    //      *
    //      * allPosts.forEach((post)=>{
    //      * totalPostViews+=post.views
    //      * })
    //      */

    //     //using Aggregation
    //     const totalPostViewsAggregate=await tx.post.aggregate({
    //         _sum:{
    //             views:true
    //         }
    //     })

    //     const totalPostViews=totalPostViewsAggregate._sum.views

    // return {
    //     totalPosts,
    //     totalPublishedPosts,
    //     totalArchivedPosts,
    //     totalDraftPosts,
    //     totalComments,
    //     totalApprovedComments,
    //     totalRejectedComments,
    //     totalPostViews
    // }

    //Instead of sequentially running we do this way beacuse we want to run all the query paralalley for make the result fast.
    const [
      totalPosts,
      totalPublishedPosts,
      totalArchivedPosts,
      totalDraftPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViewsAggregate,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),
      await tx.comment.count(),
      await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),
      await tx.comment.count({
        where: {
          status: CommentStatus.REJECTED,
        },
      }),
      await tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      totalPublishedPosts,
      totalArchivedPosts,
      totalDraftPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews: totalPostViewsAggregate._sum.views,
    };
  });

  return transactionResult;
};

const updatePost = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the owner of this post!");
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the owner of this post!");
  }

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  getPostsStats,
  updatePost,
  deletePost,
};
