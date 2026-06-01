import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddBookForm } from "./components/AddBookForm";
import { BookList } from "./components/BookList";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <h1>Book Tracker</h1>

        <section>
          <h2>Add a Book</h2>
          <AddBookForm />
        </section>

        <section>
          <h2>Book Library</h2>
          <BookList />
        </section>
      </div>
    </QueryClientProvider>
  );
}

export default App;
