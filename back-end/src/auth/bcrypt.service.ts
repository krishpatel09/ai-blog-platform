// import { Injectable } from '@nestjs/common';
// import { compare, hash } from 'bcrypt';

// @Injectable()
// export class BcryptService {
//     private readonly saltRounds = 10;

//     // Hash plain password (Signup)
//     hash(password: string): Promise<string> {
//         return hash(password, this.saltRounds);
//     }

//     // Compare passwords (Login)
//     compare(
//         plainPassword: string,
//         hashedPassword: string,
//     ): Promise<boolean> {
//         return compare(plainPassword, hashedPassword);
//     }
// }
