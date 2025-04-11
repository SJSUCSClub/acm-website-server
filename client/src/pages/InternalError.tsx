import { useNavigate } from "@tanstack/react-router";
import Page from "@/components/templates/Page";

const page = () => {
  // You have an internal error, redirect to home page with a button
  const navigate = useNavigate();

  return (
    <Page>
      <div className="w-full min-h-[calc(100vh-500px)] text-center">
        <h1 className="text-3xl font-bold mb-10">Something went wrong.</h1>
        <p className="text-gray-600">An internal error occurred. Click{" "} 
          <span className="text-blue-700 underline">
            <button onClick={() => navigate({ to: "/" })}>here</button>
          </span> 
          {" "}to return to home.
        </p>
      </div>
    </Page>
  );
};

export default page;