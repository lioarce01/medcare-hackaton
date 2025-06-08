export interface FormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData extends FormData {
  name: string;
  agreeToTerms?: boolean;
}

export interface PrivateRouteProps {
  children: React.ReactNode;
}
