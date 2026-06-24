# Interval Training

Guitar interval & chord ear training web app.

## Development

```sh
npm install
npm run dev
```

## Docker build

```sh
docker build -t interval-training .
docker run -p 3000:3000 interval-training
```

## Caddy deployment

Add to your Caddyfile on the Hetzner server:

```caddy
intervals.yourdomain.com {
	basicauth {
		# Generate hash: caddy hash-password --plaintext 1234
		user $2a$14$HASH_HERE
	}
	reverse_proxy localhost:3000
}
```

Generate the password hash:

```sh
caddy hash-password --plaintext YOUR_PIN
```
