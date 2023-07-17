import { gql } from "@apollo/client";

// Get data for the user
export const GET_ME = gql`
  query me {
    me {
      _id
      email
      username
      bookCount
      savedBooks {
        authors
        bookId
        description
        image
        link
        title
      }
    }
  }
`;
