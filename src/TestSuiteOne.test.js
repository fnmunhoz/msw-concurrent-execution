import { useEffect, useState } from "react";
import fetch from "node-fetch";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";

// App BEGIN

const ENDPOINT = "/test-suite-one/todos";

const Todos = () => {
  const [todos, setTodos] = useState();

  useEffect(() => {
    const fetchTodos = async () => {
      if (todos) return;

      const response = await fetch(`http://localhost${ENDPOINT}`);
      const data = await response.json();

      setTodos(data);
    };
    fetchTodos();
  }, [todos]);

  // RENDER

  if (!todos) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
};

// App END

// -------------

// Test BEGIN

const server = setupServer();

beforeAll(() => {
  server.listen({
    onUnhandledRequest: "warn",
  });
});

afterAll(() => {
  server.close();
});

const logWithDate = (message) => {
  console.log(`${message} --- at =>`, new Date(Date.now()).toUTCString());
};

test("renders todo item", async () => {
  logWithDate(`Start test for ENDPOINT => ${ENDPOINT}`);
  server.use(
    rest.get(ENDPOINT, (req, res, ctx) => {
      return res(
        ctx.json([
          {
            id: 1,
            title: "todo item",
          },
        ])
      );
    })
  );

  logWithDate(`HTTP handlers setup finished for ENDPOINT => ${ENDPOINT}`);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  logWithDate(`after wait for 3 seconds for ENDPOINT => ${ENDPOINT}`);

  server.printHandlers();

  render(<Todos />);

  const todo = await screen.findByText(/todo item/i);
  expect(todo).toBeInTheDocument();
});

// Test END
