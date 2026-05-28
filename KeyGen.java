import java.security.*;
import java.util.Base64;

public class KeyGen {
    public static void main(String[] args) throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        KeyPair pair = generator.generateKeyPair();
        
        System.out.println("JWT_PRIVATE_KEY_BASE64=" + Base64.getEncoder().encodeToString(pair.getPrivate().getEncoded()));
        System.out.println("JWT_PUBLIC_KEY_BASE64=" + Base64.getEncoder().encodeToString(pair.getPublic().getEncoded()));
    }
}
