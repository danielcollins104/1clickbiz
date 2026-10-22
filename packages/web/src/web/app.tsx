import { Link, Route, Switch } from "wouter";
import Index from "./pages/index";
import Shop from "./pages/shop";
import ProductPage from "./pages/product";
import CartPage from "./pages/cart";
import WishlistPage from "./pages/wishlist";
import LoginPage from "./pages/login";
import StartPage from "./pages/start";
import DashboardPage from "./pages/dashboard";
import ToolPage from "./pages/tool";
import AccountPage from "./pages/account";
import LegalPage from "./pages/legal";
import ResetPasswordPage from "./pages/reset-password";
import AdminPage from "./pages/admin";
import SitePage from "./pages/site";
import AdvisorPage from "./pages/advisor";
import { Provider } from "./components/provider";
import { Layout } from "./components/layout";
import { ProtectedRoute } from "./components/protected-route";
import { AgentFeedback } from "@runablehq/website-runtime";

function NotFound() {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-20 md:grid-cols-2">
      <img src="/images/spot-404.webp" alt="A lost cardboard box with a question mark" className="b3 hard w-full bg-paper" />
      <div>
        <h1 className="display text-8xl">404.</h1>
        <p className="mt-4 text-lg font-bold">This page took one click too many.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn">Back home</Link>
          <Link href="/pricing" className="btn btn-quiet">Subscription plans</Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider>
      <Layout>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/shop" component={Shop} />
          <Route path="/pricing" component={Shop} />
          <Route path="/product/:slug">{(params) => <ProductPage key={params.slug} />}</Route>
          <Route path="/cart" component={CartPage} />
          <Route path="/subscribe" component={CartPage} />
          <Route path="/wishlist" component={WishlistPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/terms"><LegalPage kind="terms" /></Route>
          <Route path="/privacy"><LegalPage kind="privacy" /></Route>
          <Route path="/refunds"><LegalPage kind="refunds" /></Route>
          <Route path="/contact"><LegalPage kind="contact" /></Route>
          <Route path="/reset-password" component={ResetPasswordPage} />
          <Route path="/admin"><ProtectedRoute><AdminPage /></ProtectedRoute></Route>
          <Route path="/start">
            <ProtectedRoute><StartPage /></ProtectedRoute>
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          </Route>
          <Route path="/dashboard/:tool">
            {(params) => (
              <ProtectedRoute><ToolPage key={params.tool} slug={params.tool} /></ProtectedRoute>
            )}
          </Route>
          <Route path="/account">
            <ProtectedRoute><AccountPage /></ProtectedRoute>
          </Route>
          <Route path="/advisor" component={AdvisorPage} />
          <Route path="/sites/:slug">{(params) => <SitePage key={params.slug} slug={params.slug} />}</Route>
          <Route component={NotFound} />
        </Switch>
      </Layout>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}

export default App;
