import { UserNotFound } from "../_components/user-not-found";
import { api } from "~/trpc/server";
import Profile from "./profile";

export default async function ProfilePage({
    params,
}: {
    params: { user: string };
}) {

    const email = decodeURIComponent(params.user);

    // get user id from email
    const user = await api.users.getByEmail({ email: email });
    const userId = user?.id;

    if (!userId) {
        return <UserNotFound email={email} />;
    }

    return (
        <Profile userId={userId} />
    )
}