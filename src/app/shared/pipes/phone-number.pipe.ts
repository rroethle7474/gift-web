import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phoneNumber',
    standalone: true,
    pure: true
})
export class PhoneNumberPipe implements PipeTransform {
    transform(phone: string | null): string {
        if (!phone) return '-';
        if (phone.match(/^\(\d{3}\) \d{3}-\d{4}$/)) return phone;
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length !== 10) return phone;
        return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
}
