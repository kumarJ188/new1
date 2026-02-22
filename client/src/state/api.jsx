import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "ucaApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL || "http://localhost:5000",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.global?.token || localStorage.getItem("uca_token");
      if (token) headers.set("authorization", `Bearer ${token}`);

      // Avoid caching issues that can show stale users when switching accounts
      headers.set("cache-control", "no-store");
      headers.set("pragma", "no-cache");
      return headers;
    },
  }),
  tagTypes: [
    "Me",
    "Communities",
    "Memberships",
    "Posts",
    "Comments",
    "Events",
    "Admin",
  ],
  endpoints: (build) => ({
    // Auth
    register: build.mutation({
      query: (body) => ({ url: "api/auth/register", method: "POST", body }),
    }),
    login: build.mutation({
      query: (body) => ({ url: "api/auth/login", method: "POST", body }),
    }),
    // IMPORTANT: accept token as arg so the cache key changes per-login.
    // We still read the real token from headers via prepareHeaders.
    me: build.query({
      query: (_token) => "api/auth/me",
      providesTags: ["Me"],
    }),

    // Communities
    listCommunities: build.query({
      query: (q) => ({ url: "api/communities", method: "GET", params: q ? { q } : undefined }),
      providesTags: ["Communities"],
    }),
    myCommunities: build.query({
      query: () => "api/communities/mine",
      providesTags: ["Communities"],
    }),
    createCommunity: build.mutation({
      query: (body) => ({ url: "api/communities", method: "POST", body }),
      invalidatesTags: ["Communities", "Admin"],
    }),

    // Admin community approvals
    listPendingCommunities: build.query({
      query: () => "api/admin/communities/pending",
      providesTags: ["Admin"],
    }),
    approveCommunity: build.mutation({
      query: (id) => ({ url: `api/admin/communities/${id}/approve`, method: "POST" }),
      invalidatesTags: ["Admin", "Communities"],
    }),
    rejectCommunity: build.mutation({
      query: (id) => ({ url: `api/admin/communities/${id}/reject`, method: "POST" }),
      invalidatesTags: ["Admin", "Communities"],
    }),

    // Memberships
    requestJoin: build.mutation({
      query: (communityId) => ({ url: "api/memberships/request", method: "POST", body: { communityId } }),
      invalidatesTags: ["Memberships"],
    }),
    myMemberships: build.query({
      query: () => "api/memberships/mine",
      providesTags: ["Memberships"],
    }),
    pendingMembers: build.query({
      query: (communityId) => `api/memberships/community/${communityId}/pending`,
      providesTags: ["Memberships"],
    }),
    approveMember: build.mutation({
      query: ({ communityId, memberId }) => ({
        url: `api/memberships/community/${communityId}/member/${memberId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["Memberships", "Communities"],
    }),
    rejectMember: build.mutation({
      query: ({ communityId, memberId }) => ({
        url: `api/memberships/community/${communityId}/member/${memberId}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["Memberships"],
    }),

    // Posts + Comments
    listPosts: build.query({
      query: (communityId) => `api/communities/${communityId}/posts`,
      providesTags: ["Posts"],
    }),
    createPost: build.mutation({
      query: ({ communityId, text }) => ({
        url: `api/communities/${communityId}/posts`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Posts"],
    }),
    likePost: build.mutation({
      query: ({ communityId, postId }) => ({
        url: `api/communities/${communityId}/posts/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Posts"],
    }),
    listComments: build.query({
      query: ({ communityId, postId }) => `api/communities/${communityId}/posts/${postId}/comments`,
      providesTags: ["Comments"],
    }),
    createComment: build.mutation({
      query: ({ communityId, postId, text }) => ({
        url: `api/communities/${communityId}/posts/${postId}/comments`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Comments"],
    }),

    // Events
    listEvents: build.query({
      query: (communityId) => `api/communities/${communityId}/events`,
      providesTags: ["Events"],
    }),
    createEvent: build.mutation({
      query: ({ communityId, payload }) => ({
        url: `api/communities/${communityId}/events`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Events"],
    }),
    rsvp: build.mutation({
      query: ({ communityId, eventId }) => ({
        url: `api/communities/${communityId}/events/${eventId}/rsvp`,
        method: "POST",
      }),
      invalidatesTags: ["Events"],
    }),
    volunteer: build.mutation({
      query: ({ communityId, eventId }) => ({
        url: `api/communities/${communityId}/events/${eventId}/volunteer`,
        method: "POST",
      }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useListCommunitiesQuery,
  useMyCommunitiesQuery,
  useCreateCommunityMutation,
  useListPendingCommunitiesQuery,
  useApproveCommunityMutation,
  useRejectCommunityMutation,
  useRequestJoinMutation,
  useMyMembershipsQuery,
  usePendingMembersQuery,
  useApproveMemberMutation,
  useRejectMemberMutation,
  useListPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useListCommentsQuery,
  useCreateCommentMutation,
  useListEventsQuery,
  useCreateEventMutation,
  useRsvpMutation,
  useVolunteerMutation,
} = api;
